import { Request, Response } from "express";
import {
  createConversation,
  listConversations,
  conversationBelongsToUser,
  deleteConversation,
  isDefaultTitle,
  updateConversationTitle,
} from "../services/conversationService";
import {
  addMessage,
  getConversationHistory,
  listMessages,
} from "../services/messageService";
import {
  createConversationSchema,
  addMessageSchema,
} from "../validation/conversationValidation";
import { generateTitle, getChatReply, streamChatReply } from "../services/aiService";


export async function create(req: Request, res: Response) {
  const parsed: any = createConversationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      status: "error",
      data: null,
      message: parsed?.error?.issues[0]?.message,
    });
  }
  const userId = (req as any).userId;
  const conversation = await createConversation(userId, parsed.data.title);
  res
    .status(201)
    .json({ success: true, status: "success", data: conversation });
}

export async function list(req: Request, res: Response) {
  const userId = (req as any).userId;
  const conversations = await listConversations(userId);
  res.json({ success: true, status: "success", data: conversations });
}

export async function remove(req: Request, res: Response) {
  const userId = (req as any).userId;
  const conversationId = Number(req.params.id);
  if (isNaN(conversationId)) {
    return res
      .status(400)
      .json({
        success: false,
        status: "error",
        message: "Invalid conversation id",
      });
  }
  const deleted = await deleteConversation(userId, conversationId);
  if (!deleted) {
    return res
      .status(404)
      .json({
        success: false,
        status: "error",
        message: "Conversation not found",
      });
  }
  res
    .status(204)
    .send()
    .json({
      success: true,
      status: "success",
      message: "Deleted conversation!",
    });
}

export async function getMessages(req: Request, res: Response) {
  const userId = (req as any).userId;
  const conversationId = Number(req.params.id);
  if (isNaN(conversationId)) {
    return res
      .status(400)
      .json({
        success: true,
        status: "error",
        message: "Invalid conversation id",
      });
  }

  const owns = await conversationBelongsToUser(userId, conversationId);
  if (!owns) {
    return res
      .status(404)
      .json({
        success: true,
        status: "error",
        message: "Conversation not found",
      });
  }

  const messages = await listMessages(conversationId);
  if (!messages) {
    return res
      .status(404)
      .json({ success: true, status: "error", message: "Messages not found" });
  }
  res.json({ success: true, status: "success", data: messages });
}


export async function postMessage(req: Request, res: Response) {
  const parsed: any = addMessageSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      status: "error",
      message: parsed.error.issues[0].message,
    });
  }

  const userId = (req as any).userId;
  const conversationId = Number(req.params.id);

  if (isNaN(conversationId)) {
    return res.status(400).json({
      success: false,
      status: "error",
      message: "Invalid conversation id",
    });
  }

  const owns = await conversationBelongsToUser(userId, conversationId);

  if (!owns) {
    return res.status(404).json({
      success: false,
      status: "error",
      message: "Conversation not found",
    });
  }

  // If message is not from user, save it directly
  if (parsed.data.role !== "user") {
    const message = await addMessage(
      conversationId,
      parsed.data.role,
      parsed.data.content,
    );

    return res.status(201).json({
      success: true,
      status: "success",
      message,
    });
  }

  // Get existing conversation history
  const history = await getConversationHistory(conversationId);

 
  const historyWithNewMessage: any[] = [
    ...history,
    {
      role: "user",
      content: parsed.data.content,
    },
  ];

  let replyText: string;

  try {
    replyText = await getChatReply(historyWithNewMessage);
  } catch (err) {

    return res.status(502).json({
      success: false,
      status: "error",
      message: "AI service is unavailable right now. Your message was not saved.",
    });
  }

  
  const userMessage = await addMessage(
    conversationId,
    "user",
    parsed.data.content,
  );

  // Save AI response
  const assistantMessage = await addMessage(
    conversationId,
    "assistant",
    replyText,
  );

  return res.status(201).json({
    success: true,
    status: "success",
    data: {
      userMessage,
      assistantMessage,
    },
  });
}



export async function postMessageStream(req: Request, res: Response) {
  const parsed:any = addMessageSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, status: "error", message: parsed.error.issues[0].message });
  }

  const userId = (req as any).userId;
  const conversationId = Number(req.params.id);
  if (isNaN(conversationId)) {
    return res.status(400).json({ success: false, status: "error", message: "Invalid conversation id" });
  }

  const owns = await conversationBelongsToUser(userId, conversationId);
  if (!owns) {
    return res.status(404).json({ success: false, status: "error", message: "Conversation not found" });
  }

  // Store the user's message first, same principle as Day 10 —
  // never lose it even if streaming fails partway through
  const userMessage = await addMessage(conversationId, parsed.data.role, parsed.data.content);

  if (parsed.data.role !== "user") {
    return res.status(201).json({ success: true, status: "success", message: userMessage });
  }

  const history = await getConversationHistory(conversationId);

  // Set up SSE headers — this tells the client "keep this connection open,
  // expect a stream of events, not one normal response"
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  // Send the user message id first so the client can render it immediately
  res.write(`event: user_message\ndata: ${JSON.stringify(userMessage)}\n\n`);

  try {
    const fullReply = await streamChatReply(history, (chunk) => {
      res.write(`event: chunk\ndata: ${JSON.stringify({ text: chunk })}\n\n`);
    });

    const assistantMessage = await addMessage(conversationId, "assistant", fullReply);

    res.write(`event: done\ndata: ${JSON.stringify(assistantMessage)}\n\n`);
      const stillDefault = await isDefaultTitle(conversationId);
  if (stillDefault) {
    const title = await generateTitle(parsed.data.content);
    await updateConversationTitle(conversationId, title);
    res.write(`event: title\ndata: ${JSON.stringify({ title })}\n\n`);
  }
  } catch (err) {
    res.write(`event: error\ndata: ${JSON.stringify({ message: "AI service unavailable" })}\n\n`);
  } finally {
    res.end();
  }
}



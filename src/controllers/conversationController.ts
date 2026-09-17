import { Request, Response } from "express";
import {
  createConversation,
  listConversations,
  conversationBelongsToUser,
  deleteConversation,
} from "../services/conversationService";
import { addMessage, listMessages } from "../services/messageService";
import {
  createConversationSchema,
  addMessageSchema,
} from "../validation/conversationValidation";

export async function create(req: Request, res: Response) {
  const parsed: any = createConversationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({
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
    return res.status(400).json({ success: false, status:"error", message: "Invalid conversation id" });
  }
  const deleted = await deleteConversation(userId, conversationId);
  if (!deleted) {
    return res.status(404).json({ success: false , status: "error", message: "Conversation not found" });
  }
  res.status(204).send().json({success: true, status:"success", message:"Deleted conversation!"});
}

export async function getMessages(req: Request, res: Response) {
  const userId = (req as any).userId;
  const conversationId = Number(req.params.id);
  if (isNaN(conversationId)) {
    return res.status(400).json({ success: true, status:"error", message: "Invalid conversation id" });
  }

  const owns = await conversationBelongsToUser(userId, conversationId);
  if (!owns) {
    return res.status(404).json({ success: true, status: "error", message: "Conversation not found" });
  }

  const messages = await listMessages(conversationId);
  res.json({ success: true, status:"success", data: messages });
}

export async function postMessage(req: Request, res: Response) {
  const parsed: any = addMessageSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: true, status:"error", message: parsed.error.issues[0].message });
  }

  const userId = (req as any).userId;
  const conversationId = Number(req.params.id);
  if (isNaN(conversationId)) {
    return res.status(400).json({ success: true, status:"error", message: "Invalid conversation id" });
  }

  const owns = await conversationBelongsToUser(userId, conversationId);
  if (!owns) {
    return res.status(404).json({ success: true, status: "error" ,message: "Conversation not found" });
  }

  const message = await addMessage(
    conversationId,
    parsed.data.role,
    parsed.data.content,
  );
  res.status(201).json({ success: true, status:"success", data: message });
}

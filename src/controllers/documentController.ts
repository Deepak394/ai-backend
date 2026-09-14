import { Request, Response } from "express";
import {
  createDocument,
  listDocuments,
  getDocumentById,
  deleteDocument,
  updateDocument,
} from "../services/documentService";
import { createDocumentSchema, updateDocumentSchema } from "../validation/documentValidation";
import moment from "moment/moment";
import { success } from "zod";

export async function create(req: Request, res: Response) {
  const parsed: any = createDocumentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({
        success: false,
        status: "error",
        message: parsed.error.issues[0].message,
      });
  }

  const userId = (req as any).userId; // set by authMiddleware
  const document = await createDocument(
    userId,
    parsed.data.title,
    parsed.data.raw_text,
  );
  res
    .status(201)
    .json({
      success: true,
      status: "success",
      message: "Document created successfully",
      data: document,
    });
}

export async function list(req: Request, res: Response) {
  const userId = (req as any).userId;
  const documents = await listDocuments(userId);
  const documentSummaries = documents.map((doc) => ({
    id: doc.id,
    title: doc.title,
    created_at: moment(doc.created_at).format("DD-MM-YYYY HH:mm:ss"),
  }));
  res.json({ success: true, status: "success", data: documentSummaries });
}

export async function getOne(req: Request, res: Response) {
  const userId = (req as any).userId;
  const documentId = Number(req.params.id);

  if (isNaN(documentId)) {
    return res
      .status(400)
      .json({
        success: false,
        status: "error",
        message: "Invalid document id",
      });
  }

  const document = await getDocumentById(userId, documentId);
  if (!document) {
    return res
      .status(404)
      .json({ success: false, status: "error", message: "Document not found" });
  }
  const formattedDocument = {
    id: document.id,
    title: document.title,
    raw_text: document.raw_text,
    type: document.type === "document" ? "Document" : "Note",
    created_at: moment(document.created_at).format("DD-MM-YYYY HH:mm:ss"),
  };
  res.json({ success: true, status: "success", data: formattedDocument });
}

export async function remove(req: Request, res: Response) {
  const userId = (req as any).userId;
  const documentId = Number(req.params.id);

  if (isNaN(documentId)) {
    return res
      .status(400)
      .json({
        success: false,
        status: "error",
        message: "Invalid document id",
      });
  }

  const deleted = await deleteDocument(userId, documentId);
  if (!deleted) {
    return res
      .status(404)
      .json({ success: false, status: "error", message: "Document not found" });
  }
  res.status(204).send({
    success: true,
    status: "success",
    message: "Document deleted successfully",
  });
}

export async function update(req: Request, res: Response) {
  const parsed:any = updateDocumentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, status:"error", message: parsed.error.issues[0].message });
  }

  const userId = (req as any).userId;
  const documentId = Number(req.params.id);
  if (isNaN(documentId)) {
    return res.status(400).json({ success: true, status:"error", message: "Invalid document id" });
  }

  const updated = await updateDocument(userId, documentId, parsed.data);
  if (!updated) {
    return res.status(404).json({ error: "Document not found" });
  }
  res.json({success:true, status:"error", data: updated });
}

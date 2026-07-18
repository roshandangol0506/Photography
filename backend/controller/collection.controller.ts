import { Request, Response } from "express";
import { StatusCodes } from "../constant/statusCodes";
import { Message } from "../constant/messages";
import collectionService from "../services/collection.service";

const CollectionService = new collectionService();

class collectionController {
  async createCollection(req: Request, res: Response) {
    const response = await CollectionService.createCollection(req.body);
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: Message.created,
      data: response,
    });
  }

  async getCollections(req: Request, res: Response) {
    const response = await CollectionService.getCollections(req.query);
    res.status(StatusCodes.SUCCESS).json({
      success: true,
      message: Message.fetched,
      data: response,
    });
  }

  async getActiveCollections(req: Request, res: Response) {
    const response = await CollectionService.getActiveCollections();
    res.status(StatusCodes.SUCCESS).json({
      success: true,
      message: Message.fetched,
      data: response,
    });
  }

  async getCollectionById(req: Request, res: Response) {
    const response = await CollectionService.getCollectionById(req.params.id);
    res.status(StatusCodes.SUCCESS).json({
      success: true,
      message: Message.fetched,
      data: response,
    });
  }

  async updateCollection(req: Request, res: Response) {
    const response = await CollectionService.updateCollection(
      req.params.id,
      req.body,
    );
    res.status(StatusCodes.SUCCESS).json({
      success: true,
      message: Message.updated,
      data: response,
    });
  }

  async deleteCollection(req: Request, res: Response) {
    const response = await CollectionService.deleteCollection(req.params.id);
    res.status(StatusCodes.SUCCESS).json({
      success: true,
      message: Message.deleted,
      data: response,
    });
  }
}

export default collectionController;

import { FastifyInstance } from "fastify";
import { authenticate } from "../plugins/authenticate";
import { uploadFile } from "../ipfs/pinata";

export async function uploadRoutes(app: FastifyInstance) {
  app.post("/", {
    schema: {
      description: "Upload a file to IPFS via Pinata",
      tags: ["upload"],
      security: [{ bearerAuth: [] }],
      consumes: ["multipart/form-data"],
    },
    onRequest: [authenticate],
  }, async (request, reply) => {
    const data = await request.file();

    if (!data) {
      return reply.badRequest("No file provided");
    }

    const buffer = await data.toBuffer();
    const result = await uploadFile(buffer, data.filename);

    return reply.code(201).send({
      cid: result.cid,
      url: result.url,
      filename: data.filename,
      mimetype: data.mimetype,
    });
  });
}

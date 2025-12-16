
import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = createServer(async (req, res) => {
        try {
            const parsedUrl = parse(req.url!, true);
            await handle(req, res, parsedUrl);
        } catch (err) {
            console.error("Error occurred handling", req.url, err);
            res.statusCode = 500;
            res.end("internal server error");
        }
    });

    const io = new Server(server);

    io.on("connection", (socket) => {
        // Join room based on restaurantId (passed via query or auth)
        // For simplicity, client joins "restaurant:{slug}" or "restaurant:{id}"
        const { slug } = socket.handshake.query;
        if (slug) {
            socket.join(`restaurant:${slug}`);
            console.log(`Socket ${socket.id} joined ${slug}`);
        }

        socket.on("order:new", (data) => {
            // Broadcast to KDS
            io.to(`restaurant:${slug}`).emit("kitchen:order:new", data);
        });
    });

    // Make IO accessible globally (for Server Actions)?
    // In Next.js Server Actions, we can't easily access this 'io' instance.
    // Standard pattern: Use a separate Redis/Bus or a Singleton if in same process.
    // For 'ts-node server.ts', the 'global' object is shared? No, Next.js builds separate chunks.
    // We might need a separate Emitter logic or just rely on Client-side emission for V2 MVP.
    // Better: Server Actions publish to Redis, WS Server subscribes.
    // MVP: Client emits 'order:new' upon success.

    server.listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`);
    });
});

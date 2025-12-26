import { Hono } from "hono";
import api from "./routes/api";
import webhook from "./routes/webhook";

const app = new Hono<{ Bindings: Env }>();

app.get("/", (c) => {
	return c.json({
		success: true,
		message: "Oad's Greeting Cards API",
		version: "1.0.0",
		endpoints: {
			api: "/api",
			webhook: "/webhook",
		},
	});
});

app.route("/api", api);
app.route("/webhook", webhook);

export default app;

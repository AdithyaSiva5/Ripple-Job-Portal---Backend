"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const errorMiddleware_1 = __importDefault(require("./middlewares/errorMiddleware"));
const express_session_1 = __importDefault(require("express-session"));
const jobRoutes_1 = __importDefault(require("./routes/jobRoutes"));
const chatRoutes_1 = __importDefault(require("./routes/chatRoutes"));
const connectionRoutes_1 = __importDefault(require("./routes/connectionRoutes"));
const cors_1 = __importDefault(require("cors"));
const postRoutes_1 = __importDefault(require("./routes/postRoutes"));
const path_1 = __importDefault(require("path"));
const socket_io_1 = require("socket.io");
const socket_1 = __importDefault(require("./utils/socket/socket"));
const http_1 = __importDefault(require("http"));
const scheduledTask_1 = __importDefault(require("./utils/scheduledTask"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: '*',
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
}));
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "public", "uploads")));
app.use(express_1.default.static(path_1.default.join(__dirname, '../../Ripple-Job-Portal-Frontend/dist')));
const sessionSecret = process.env.SESSION_SECRET || "default_secret_key";
app.use((0, express_session_1.default)({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000,
    },
}));
app.use((0, cookie_parser_1.default)());
app.use("/api/", userRoutes_1.default);
app.use("/api/admin", adminRoutes_1.default);
app.use("/api/post", postRoutes_1.default);
app.use("/api/job", jobRoutes_1.default);
app.use("/api/connection", connectionRoutes_1.default);
app.use("/api/chat", chatRoutes_1.default);
(0, scheduledTask_1.default)();
// Create HTTP server
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: { origin: "*" },
});
// Configure Socket.IO
(0, socket_1.default)(io);
app.use(errorMiddleware_1.default);
(0, db_1.default)();
const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../../Ripple-Job-Portal-Frontend/dist/index.html'));
});

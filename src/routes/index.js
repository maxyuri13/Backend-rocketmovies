const { Router } = require("express");

const usersRouter = require("./users.routes");
const movieNotesRouter = require("./movieNotes.routes");
const movieTagsRouter = require("./movieTags.routes");
const sessionsRoutes = require("./sessions.routes");


const routes = Router();
routes.use("/users", usersRouter);
routes.use("/sessions", sessionsRoutes);
routes.use("/movieNotes", movieNotesRouter);
routes.use("/movieTags", movieTagsRouter);

module.exports = routes;
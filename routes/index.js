"use strict";
const express = require("express");
const router = express.Router();

const V1Router = require("./v1");
const AdminRouter = require("./admin");

router.use("/v1", V1Router);

module.exports = router;

/*
RESRFUL APIs
==========================================================
# HTTP   |  path_var           | path           | action
----------------------------------------------------------
  GET    |  books_path         | /books         | index
  GET    |  book_path(id)      | /books/id      | show
  GET    |  new_book_path      | /books/new     | new
  POST   |  books_path         | /books         | create
  GET    |  edit_book_path(id) | /books/id/edit | edit
  PUT    |  book_path(id)      | /books/id      | update
  DELETE |  book_path(id)      | /books/id      | destroy
*/

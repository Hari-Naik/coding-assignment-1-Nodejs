const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const { format } = require("date-fns");
const isValid = require("date-fns/isValid");

const databasePath = path.join(__dirname, "todoApplication.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const formatData = (todo) => ({
  id: todo.id,
  todo: todo.todo,
  priority: todo.priority,
  status: todo.status,
  category: todo.category,
  dueDate: todo.due_date,
});

function validateGetRequestData(request, response, next) {
  const { status, priority, category, date } = request.query;
  if (status !== undefined) {
    switch (status) {
      case "TO DO":
        next();
        break;
      case "IN PROGRESS":
        next();
        break;
      case "DONE":
        next();
        break;
      default:
        response.status(400);
        response.send("Invalid Todo Status");
        break;
    }
  } else if (priority !== undefined) {
    switch (priority) {
      case "HIGH":
        next();
        break;
      case "MEDIUM":
        next();
        break;
      case "LOW":
        next();
        break;
      default:
        response.status(400);
        response.send("Invalid Todo Priority");
        break;
    }
  } else if (category !== undefined) {
    switch (category) {
      case "WORK":
        next();
        break;
      case "HOME":
        next();
        break;
      case "LEARNING":
        next();
        break;
      default:
        response.status(400);
        response.send("Invalid Todo Category");
        break;
    }
  } else if (date !== undefined) {
    if (isValid(new Date(date)) === true) {
      next();
    } else {
      response.status(400);
      response.send("Invalid Due Date");
    }
  }
}

function validateRequestBodyData(request, response, next) {
  const { status, priority, category, dueDate } = request.body;
  if (status !== undefined) {
    switch (status) {
      case "TO DO":
        next();
        break;
      case "IN PROGRESS":
        next();
        break;
      case "DONE":
        next();
        break;
      default:
        response.status(400);
        response.send("Invalid Todo Status");
        break;
    }
  }
  if (priority !== undefined) {
    switch (priority) {
      case "HIGH":
        next();
        break;
      case "MEDIUM":
        next();
        break;
      case "LOW":
        next();
        break;
      default:
        response.status(400);
        response.send("Invalid Todo Priority");
        break;
    }
  }
  if (category !== undefined) {
    switch (category) {
      case "WORK":
        next();
        break;
      case "HOME":
        next();
        break;
      case "LEARNING":
        next();
        break;
      default:
        response.status(400);
        response.send("Invalid Todo Category");
        break;
    }
  }
  if (dueDate !== undefined) {
    if (isValid(new Date(dueDate))) {
      next();
    } else {
      response.status(400);
      response.send("Invalid Due Date");
    }
  }
}

const hasCategoryAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

const hasCategoryProperty = (requestQuery) => {
  return requestQuery.category !== undefined;
};

app.get("/todos", validateGetRequestData, async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", priority, status, category } = request.query;

  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND status = '${status}'
        AND priority = '${priority}';`;
      break;
    case hasPriorityProperty(request.query):
      getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND priority = '${priority}';`;
      break;
    case hasStatusProperty(request.query):
      getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND status = '${status}';`;
      break;
    case hasCategoryAndStatusProperties(request.query):
      getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        category = '${category}'
        AND status = '${status}';`;
      break;
    case hasCategoryProperty(request.query):
      getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        category = '${category}';`;
      break;

    default:
      getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%';`;
      break;
  }

  data = await database.all(getTodosQuery);
  response.status(200);
  const formattedData = data.map((eachTodo) => formatData(eachTodo));
  response.send(formattedData);
});

//API 2

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const getTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE
      id = ${todoId};`;
  const todo = await database.get(getTodoQuery);
  response.send(formatData(todo));
});

//API 3

app.get("/agenda/", validateGetRequestData, async (request, response) => {
  const { date } = request.query;
  const formattedDate = format(new Date(date), "yyyy-MM-dd");
  const getQuery = `SELECT * FROM todo
  WHERE due_date = '${formattedDate}';`;
  const data = await database.all(getQuery);
  const formattedData = data.map((eachTodo) => formatData(eachTodo));
  response.send(formattedData);
});

//API 4

app.post("/todos/", validateRequestBodyData, async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;

  const postQuery = `INSERT INTO todo (id,todo,category,priority,status,due_date)
    VALUES(
        ${id},
        '${todo}',
        '${category}',
        '${priority}',
        '${status}',
        '${dueDate}'
    );`;
  await database.run(postQuery);
  response.status(200);
  response.send("Todo Successfully Added");
});

//API 5
app.put(
  "/todos/:todoId/",
  validateRequestBodyData,
  async (request, response) => {
    const { todoId } = request.params;
    let updatedColumn = "";
    const requestBody = request.body;
    console.log(requestBody.status);
    switch (true) {
      case requestBody.status !== undefined:
        updatedColumn = "Status";
        break;
      case requestBody.priority !== undefined:
        updatedColumn = "Priority";
        break;
      case requestBody.todo !== undefined:
        updatedColumn = "Todo";
      case requestBody.category !== undefined:
        updatedColumn = "Category";
      case requestBody.dueDate !== undefined:
        updatedColumn = "Due Date";
        break;
    }
    const previousTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE 
      id = ${todoId};`;
    const previousTodo = await database.get(previousTodoQuery);

    const {
      todo = previousTodo.todo,
      priority = previousTodo.priority,
      status = previousTodo.status,
      category = previousTodo.category,
      dueDate = previousTodo.due_date,
    } = request.body;

    const updateTodoQuery = `
    UPDATE
      todo
    SET
      todo='${todo}',
      priority='${priority}',
      status='${status}',
      category = '${category}',
      due_date = '${dueDate}'
    WHERE
      id = ${todoId};`;

    await database.run(updateTodoQuery);
    response.send(`${updatedColumn} Updated`);
  }
);

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
  DELETE FROM
    todo
  WHERE
    id = ${todoId};`;

  await database.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;

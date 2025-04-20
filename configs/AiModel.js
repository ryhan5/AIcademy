const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } = require("@google/generative-ai");
  
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });
  
  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
  };
  const generationConfig2 = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  };
  
  
    export const courseOutlineAiModel = model.startChat({
      generationConfig,
      history: [
        {
          role: "user",
          parts: [
            {text: "Generate a study material outline with the following structure exactly: {\"courseTitle\": string, \"courseSummary\": string, \"chapters\": [{\"chapterTitle\": string, \"chapterSummary\": string, \"topics\": [string]}]}. Each chapter should include a title, summary, and an array of topic strings. The response must be valid JSON."},
          ],
        },
        {
          role: "model",
          parts: [
            {text: "{\"courseTitle\":\"Introduction to Programming\",\"courseSummary\":\"This course provides a comprehensive introduction to programming concepts, focusing on fundamentals applicable across various languages.\",\"chapters\":[{\"chapterTitle\":\"Getting Started with Programming\",\"chapterSummary\":\"This chapter introduces basic programming concepts and environment setup.\",\"topics\":[\"What is Programming?\",\"Setting Up Your Development Environment\",\"Basic Syntax and Structure\",\"Variables and Data Types\",\"Writing Your First Program\"]},{\"chapterTitle\":\"Control Flow\",\"chapterSummary\":\"This chapter covers how to control the flow of execution in programs.\",\"topics\":[\"Conditional Statements (if-else)\",\"Logical Operators\",\"Switch Statements\",\"Loops (for, while, do-while)\",\"Break and Continue Statements\"]}]}"},
          ],
        },
      ],
    });


   export const generateNotesAiModel = model.startChat({
      generationConfig2,
      history: [
        {
          role: "user",
          parts: [
            {text: "generate exam material detail content for each chapter, make sure to include all topics point in the content,make sure to give content in html format (Do not include htmlkl,head ,body,title tag)\nthe chapters:\n  \"chapterTitle\": \"Advanced State Management with Redux Toolkit\",\n      \"chapterSummary\": \"This chapter delves into advanced state management techniques using Redux Toolkit, emphasizing efficient data handling and architectural best practices for large-scale applications.\",\n      \"topics\": [\n        \"Redux fundamentals (reducers, actions, store)\",\n        \"Redux Toolkit: createSlice, createAsyncThunk\",\n        \"Middleware: Logging, error handling, asynchronous operations\",\n        \"Normalizing state: Improving data structure and performance\",\n        \"Advanced selectors and data transformations\",\n        \"Testing Redux reducers and actions\""},
          ],
        },
        {
          role: "model",
          parts: [
            {text: "```html\n<h1>Advanced State Management with Redux Toolkit</h1>\n\n<p>This chapter explores advanced state management strategies using Redux Toolkit, focusing on effective data management and architectural best practices for complex applications.</p>\n\n<h2>Redux Fundamentals (Reducers, Actions, Store)</h2>\n<ul>\n  <li>Defining actions and action creators</li>\n  <li>Creating reducers with immutability best practices</li>\n  <li>Setting up the Redux store and integrating it with a React application</li>\n  <li>Understanding the Redux data flow (dispatching actions, updating the state)</li>\n  <li>Using the <code>connect</code> function (or equivalent hooks) to connect components to the store.</li>\n  <li>Practice exercises: Building a simple counter app using basic Redux.</li>\n</ul>\n\n\n<h2>Redux Toolkit: createSlice, createAsyncThunk</h2>\n<ul>\n  <li>Introduction to Redux Toolkit and its benefits</li>\n  <li>Using <code>createSlice</code> to simplify reducer creation</li>\n  <li>Handling asynchronous operations with <code>createAsyncThunk</code></li>\n  <li>Managing loading states, success states, and error states with <code>createAsyncThunk</code></li>\n  <li>Example: Fetching data from an API using <code>createAsyncThunk</code></li>\n  <li>Practice exercises: Building an app that fetches and displays data from an API.</li>\n</ul>\n\n\n<h2>Middleware: Logging, Error Handling, Asynchronous Operations</h2>\n<ul>\n  <li>Understanding middleware and its role in the Redux lifecycle</li>\n  <li>Implementing logging middleware to monitor actions and state changes</li>\n  <li>Creating custom middleware for error handling and centralized error logging</li>\n  <li>Using middleware to handle asynchronous operations (alternatives to <code>createAsyncThunk</code>)</li>\n  <li>Example: Implementing a custom middleware for API request logging and error handling</li>\n  <li>Practice exercises: Adding logging and error handling middleware to a Redux application</li>\n</ul>\n\n\n<h2>Normalizing State: Improving Data Structure and Performance</h2>\n<ul>\n  <li>Understanding the challenges of deeply nested state structures</li>\n  <li>Implementing normalized state structures using entity IDs and lookup tables</li>\n  <li>Benefits of normalized state: Improved performance and reduced redundancy</li>\n  <li>Example: Normalizing a state structure with related entities</li>\n  <li>Practice exercises: Normalizing the state of an application with multiple related data entities.</li>\n</ul>\n\n\n<h2>Advanced Selectors and Data Transformations</h2>\n<ul>\n  <li>Creating custom selectors for derived data</li>\n  <li>Using <code>reselect</code> library for memoization of selectors</li>\n  <li>Advanced selector techniques: combining selectors, filtering data, and transforming data</li>\n  <li>Example: Implementing complex selectors to calculate aggregate statistics from normalized data.</li>\n  <li>Practice exercises: Creating efficient and reusable selectors for various data transformations.</li>\n</ul>\n\n\n<h2>Testing Redux Reducers and Actions</h2>\n<ul>\n  <li>Writing unit tests for reducers using assertion libraries (e.g., Jest, Chai)</li>\n  <li>Testing action creators to ensure they produce the correct action objects</li>\n  <li>Techniques for testing asynchronous actions with <code>createAsyncThunk</code></li>\n  <li>Example: Writing comprehensive unit tests for reducers and actions</li>\n  <li>Practice exercises: Writing unit tests for a given Redux application.</li>\n</ul>\n```\n"},
          ],
        },
      ],
    });

    //generate flashcards with Gemini model
    export const GenerateStudyTypeContentAiModel = model.startChat({
      generationConfig,
      history: [
        {
          role: "user",
          parts: [
            {text: "Generate a set of flashcards on a topic with these properties: 'id', 'front', 'back', and 'difficulty' (one of 'Easy', 'Medium', or 'Hard'). Output MUST be a valid JSON array. For example: [{\"id\":\"fc-1\", \"front\":\"What is React?\",\"back\":\"A JavaScript library for building user interfaces\", \"difficulty\":\"Easy\"}]. Always use proper JSON format that can be parsed directly."},
          ],
        },
        {
          role: "model",
          parts: [ 
            {text: "[{\"id\":\"fc-1\",\"front\":\"What is a flashcard?\",\"back\":\"A learning tool that displays a question on one side and the answer on the other.\",\"difficulty\":\"Easy\"},{\"id\":\"fc-2\",\"front\":\"What format will these flashcards use?\",\"back\":\"A JSON array where each object has 'id', 'front', 'back', and 'difficulty' properties.\",\"difficulty\":\"Medium\"}]"},
          ],
        },
      ],
    });



    export const GenerateQuizAiModel = model.startChat({
      generationConfig,
      history: [
        {
          role: "user",
          parts: [
            {text: "generate quiz on topic: flutter fundamentals user interfcae ui development, basics App navigation with question and options along with correct answer in json format"},
          ],
        },
        {
          role: "model",
          parts: [
            {text: "```json\n{\n  \"quizTitle\": \"Flutter Fundamentals: UI Development & App Navigation\",\n  \"questions\": [\n    {\n      \"questionNumber\": 1,\n      \"questionText\": \"Which widget is the fundamental building block for UI in Flutter?\",\n      \"options\": [\n        \"Container\",\n        \"Widget\",\n        \"Text\",\n        \"Row\"\n      ],\n      \"correctAnswer\": \"Widget\"\n    },\n    {\n      \"questionNumber\": 2,\n      \"questionText\": \"What is the purpose of the `build` method in a Flutter widget?\",\n      \"options\": [\n        \"To define the widget's visual appearance\",\n        \"To handle user input\",\n        \"To manage the widget's state\",\n        \"To initialize the widget\"\n      ],\n      \"correctAnswer\": \"To define the widget's visual appearance\"\n    },\n    {\n       \"questionNumber\": 3,\n      \"questionText\": \"Which widget is used to display a single line of text?\",\n       \"options\": [\n        \"TextField\",\n        \"Text\",\n        \"RichText\",\n        \"Label\"\n      ],\n      \"correctAnswer\": \"Text\"\n    },\n    {\n      \"questionNumber\": 4,\n      \"questionText\": \"How do you arrange widgets horizontally in Flutter?\",\n      \"options\": [\n        \"Using a Column widget\",\n        \"Using a Stack widget\",\n        \"Using a Row widget\",\n        \"Using a Container widget\"\n      ],\n      \"correctAnswer\": \"Using a Row widget\"\n    },\n      {\n      \"questionNumber\": 5,\n      \"questionText\": \"Which widget allows you to stack widgets on top of each other?\",\n       \"options\": [\n        \"Column\",\n        \"Row\",\n        \"Stack\",\n         \"ListView\"\n      ],\n      \"correctAnswer\": \"Stack\"\n    },\n     {\n      \"questionNumber\": 6,\n      \"questionText\": \"What is the purpose of the `Navigator` class in Flutter?\",\n      \"options\": [\n        \"To manage the layout of widgets\",\n        \"To handle user gestures\",\n        \"To manage navigation between screens\",\n        \"To perform network requests\"\n      ],\n        \"correctAnswer\": \"To manage navigation between screens\"\n    },\n     {\n      \"questionNumber\": 7,\n      \"questionText\": \"Which method is used to push a new screen onto the navigation stack?\",\n       \"options\": [\n        \"pushReplacementNamed\",\n        \"pop\",\n        \"pushNamed\",\n        \"navigate\"\n      ],\n      \"correctAnswer\": \"pushNamed\"\n    },\n    {\n      \"questionNumber\": 8,\n      \"questionText\": \"How do you return to the previous screen in Flutter's navigation?\",\n      \"options\": [\n        \"By calling `pushNamed`\",\n        \"By calling `pop`\",\n        \"By calling `setState`\",\n        \"By calling `build`\"\n      ],\n       \"correctAnswer\": \"By calling `pop`\"\n    },\n    {\n        \"questionNumber\": 9,\n        \"questionText\":\"What is the use of MaterialPageRoute in flutter navigation?\",\n        \"options\":[\n            \"To manage application state\",\n            \"To create a route with material design animations\",\n            \"To create a custom route with no animations\",\n            \"To handle app configurations\"\n        ],\n        \"correctAnswer\":\"To create a route with material design animations\"\n    },\n    {\n      \"questionNumber\": 10,\n      \"questionText\": \"What is a 'Named Route' in Flutter navigation?\",\n      \"options\": [\n        \"A route that has a predefined name associated with it\",\n        \"A route that is only used for one specific screen\",\n        \"A route that cannot be popped\",\n        \"A route that does not require a builder function\"\n      ],\n      \"correctAnswer\": \"A route that has a predefined name associated with it\"\n    }\n  ]\n}\n```\n"},
          ],
        },
      ],
    });




  
//     const result = await courseOutlineAiModel.sendMessage("Provide detailed React concepts for intermediate learners.");
// console.log(result.response.text());

 
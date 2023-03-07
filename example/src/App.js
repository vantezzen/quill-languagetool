import React, { useState } from "react";
import ReactQuill, { Quill } from "react-quill";
import registerQuillLanguageTool from "quill-spell-checker";

registerQuillLanguageTool(Quill);
const modules = {
  toolbar: null,
  languageTool: {
    server: process.env.LANGUAGE_TOOL_URI,
    language: 'pt-BR',
    cooldownTime: process.env.LANGUAGE_TOOL_URI ? 1000 : 3000,
  },
};

const App = () => {
  const [value, setValue] = useState("");
  return (
    <ReactQuill
      value={value}
      onChange={setValue}
      modules={modules}
      formats={null}
    />
  );
};
export default App;

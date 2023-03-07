import React, { useState } from "react";
import ReactQuill, { Quill } from "react-quill";
import registerQuillLanguageTool from "quill-spell-checker";

registerQuillLanguageTool(Quill);

const modules = {
  toolbar: null,
  languageTool: {
    server: process.env.REACT_APP_LANGUAGE_TOOL_URI,
    language: 'pt-BR',
    cooldownTime: process.env.REACT_APP_LANGUAGE_TOOL_URI ? 1000 : 3000,
    showLoadingIndicator: false,
    apiOptions: {
      disabledCategories: 'FORMAL_SPEECH',
    }
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

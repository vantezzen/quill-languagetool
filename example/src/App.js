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
  const val = 'Jontus era um macaquinho muito intilijente. Ele gostava de explora a floresta e de descubrir coisas novas. Um dia, ele viu um bichinho no chão e correu até ele para pegalo. Mas quando chegou perto, viu que o bichinho era uma lagartixa muito assustada. Jontus ficou triste por ter assustado a lagartixa e decidiu se desculpar. Ele falou "descupa, eu não qui fazer mal. Eu só queria brincar". A lagartixa ficou mais calma e os dois se tornaram amigos.'
  const [value, setValue] = useState(val);

  return (
    <ReactQuill
      defaultValue={val}
      onChange={(_,__,___,editor) => setValue(editor.getText())}
      modules={modules}
      formats={null}
    />
  );
};
export default App;

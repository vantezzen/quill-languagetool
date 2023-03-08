import React, { useState } from 'react'
import ReactQuill, { Quill } from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import registerQuillSpellChecker from 'react-quill-spell-checker'

registerQuillSpellChecker(Quill)

const addDisabledCategoriesOnBody = (text) => {
  const body = {
    text,
    language: 'auto',
    disabledCategories: 'FORMAL_SPEECH'
  }
  return Object.keys(body)
    .map((key) => `${key}=${encodeURIComponent(body[key])}`)
    .join('&')
}

const modules = {
  spellChecker: {
    cooldownTime: process.env.REACT_APP_COOLDOWN_TIME,
    showLoadingIndicator: true,
    api: {
      url: process.env.REACT_APP_SPELL_CHECKER_URI,
      body: addDisabledCategoriesOnBody
    }
  }
}
const App = () => {
  const [value, setValue] = useState('')

  return (
    <ReactQuill defaultValue={value} onChange={setValue} modules={modules} />
  )
}
export default App

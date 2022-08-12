import React from 'react'

import { useMyHook } from 'quill-languagetool'

const App = () => {
  const example = useMyHook()
  return (
    <div>
      {example}
    </div>
  )
}
export default App

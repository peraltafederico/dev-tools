import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import TextCompare from './pages/TextCompare'
import JsonPrettifier from './pages/JsonPrettifier'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="text-compare" element={<TextCompare />} />
        <Route path="json-prettifier" element={<JsonPrettifier />} />
      </Route>
    </Routes>
  )
}

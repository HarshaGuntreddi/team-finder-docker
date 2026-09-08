import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Directory } from './pages/Directory'
import { FindTeam } from './pages/FindTeam'
import { ManageData } from './pages/ManageData'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/directory" element={<Directory />} />
        <Route path="/find-team" element={<FindTeam />} />
        <Route path="/manage" element={<ManageData />} />
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </Layout>
  )
}

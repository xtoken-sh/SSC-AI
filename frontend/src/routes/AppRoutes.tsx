import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from '../pages/HomePage'
import LibraryPage from '../pages/LibraryPage'
import GamePage from '../pages/GamePage'
import BottomPage from '../pages/BottomPage'
import ResultPage from '../pages/ResultPage'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/library" element={<LibraryPage />} />
      <Route path="/game/:id" element={<GamePage />} />
      <Route path="/bottom/:storyId" element={<BottomPage />} />
      <Route path="/result/:storyId" element={<ResultPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}


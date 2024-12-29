import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useAuth } from './contexts/AuthContext'
import LandingPage from './pages/LandingPage'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Profile from './pages/Profile'
import ProfileSetup from './pages/ProfileSetup'
import Search from './pages/Search'
import Messages from './pages/Messages'
import { useTheme } from './contexts/ThemeContext'
import AnimatedBackground from './components/backgrounds/AnimatedBackground'
import PageTransition from './components/shared/PageTransition'
import MainNav from './components/navigation/MainNav'
import BottomNav from './components/navigation/BottomNav'
import ConversationView from './pages/Messages/ConversationView'
import { useState } from 'react'
import { BackgroundType } from './types'
import Feeds from './pages/Feeds'
import Games from './pages/Games'
import Store from './pages/Store'
import UserCard from './pages/UserCard'
import NewBlog from './pages/Blog/NewBlog'
import BlogPost from './pages/Blog/BlogPost'
import EditBlog from './pages/Blog/EditBlog'
import { ThemeProvider } from './contexts/ThemeContext'
import GameView from './pages/Games/GameView'


export default function App() {
  const { backgroundType, pattern } = useTheme()
  const { user } = useAuth()
  const location = useLocation()
  const [isGameMode, setIsGameMode] = useState(false)

  return (
    <ThemeProvider>
      <div className="relative min-h-screen bg-black">
        {/* Background layer */}
        <div className="fixed inset-0" style={{ zIndex: 0 }}>
          <AnimatedBackground
            sceneType={backgroundType as BackgroundType}
            pattern={backgroundType === 'pattern' ? pattern : undefined}
          />
        </div>

        {/* Content layer */}
        <div className="relative" style={{ zIndex: 1 }}>
          <MainNav />
          <main className={user ? "md:pl-20 pb-16 md:pb-0 min-h-screen" : "min-h-screen"}>
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route 
                  path="/feeds" 
                  element={
                    user ? (
                      <PageTransition>
                        <Feeds />
                      </PageTransition>
                    ) : (
                      <Navigate to="/login" />
                    )
                  } 
                />
                <Route 
                  path="/" 
                  element={
                    user ? (
                      <Navigate to={`/${user.user_metadata.username}`} />
                    ) : (
                      <PageTransition>
                        <LandingPage />
                      </PageTransition>
                    )
                  } 
                />
                <Route 
                  path="/login" 
                  element={
                    user ? (
                      <Navigate to={`/${user.user_metadata.username}`} />
                    ) : (
                      <PageTransition>
                        <Login />
                      </PageTransition>
                    )
                  } 
                />
                <Route 
                  path="/register" 
                  element={
                    <PageTransition>
                      <Register />
                    </PageTransition>
                  } 
                />
                <Route 
                  path="/setup" 
                  element={
                    user ? (
                      <PageTransition>
                        <ProfileSetup />
                      </PageTransition>
                    ) : (
                      <Navigate to="/login" />
                    )
                  } 
                />
                <Route 
                  path="/:username" 
                  element={
                    <PageTransition>
                      <Profile isGameMode={isGameMode} setIsGameMode={setIsGameMode} />
                    </PageTransition>
                  } 
                />
                <Route 
                  path="/search" 
                  element={
                    <PageTransition>
                      <Search />
                    </PageTransition>
                  } 
                />
                <Route 
                  path="/messages" 
                  element={
                    <PageTransition>
                      <Messages />
                    </PageTransition>
                  } 
                />
                <Route 
                  path="/messages/:conversationId" 
                  element={
                    user ? (
                      <PageTransition>
                        <ConversationView />
                      </PageTransition>
                    ) : (
                      <Navigate to="/login" />
                    )
                  } 
                />
                <Route 
                  path="/games" 
                  element={
                    user ? (
                      <PageTransition>
                        <Games />
                      </PageTransition>
                    ) : (
                      <Navigate to="/login" />
                    )
                  } 
                />
                <Route 
                  path="/store" 
                  element={
                    user ? (
                      <PageTransition>
                        <Store />
                      </PageTransition>
                    ) : (
                      <Navigate to="/login" />
                    )
                  } 
                />
                <Route 
                  path="/:username/card" 
                  element={
                    <PageTransition>
                      <UserCard />
                    </PageTransition>
                  } 
                />
                <Route 
                  path="/blog/new" 
                  element={
                    user ? (
                      <PageTransition>
                        <NewBlog />
                      </PageTransition>
                    ) : (
                      <Navigate to="/login" />
                    )
                  } 
                />
                <Route 
                  path="/blog/:id" 
                  element={
                    <PageTransition>
                      <BlogPost />
                    </PageTransition>
                  } 
                />
                <Route 
                  path="/blog/edit/:id" 
                  element={
                    user ? (
                      <PageTransition>
                        <EditBlog />
                      </PageTransition>
                    ) : (
                      <Navigate to="/login" />
                    )
                  } 
                />
                <Route 
                  path="/games/:gameId" 
                  element={
                    <PageTransition>
                      <GameView />
                    </PageTransition>
                  } 
                />
              </Routes>
            </AnimatePresence>
          </main>
          <BottomNav />
        </div>
      </div>
    </ThemeProvider>
  )
}

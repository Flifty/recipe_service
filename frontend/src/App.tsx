import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { RecipesPage } from './pages/RecipesPage';
import { RecipeDetailsPage } from './pages/RecipeDetailsPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { ProfilePage } from './pages/ProfilePage';
import { SmartSearchPage } from './pages/SmartSearchPage';
import { RecentlyViewedPage } from './pages/RecentlyViewedPage';
import { ToastProvider } from './components/ToastProvider';

function App() {
    return (
        <ToastProvider>
            <BrowserRouter>
                <Routes>
                    <Route element={<MainLayout />}>
                        <Route path="/" element={<RecipesPage />} />
                        <Route path="/recipes/:id" element={<RecipeDetailsPage />} />
                        <Route path="/favorites" element={<FavoritesPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/smart-search" element={<SmartSearchPage />} />
                        <Route path="/recently-viewed" element={<RecentlyViewedPage />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </ToastProvider>
    );
}

export default App;
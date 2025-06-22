import MainLayout from "./components/layout/MainLayout";
import { routes } from "./routes/index";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Provider } from 'react-redux';
import { store } from './redux/store';

const App = () => {
    return (
        <Provider store={store}>
            <BrowserRouter>
                <Routes>
                    <Route path='/' element={<MainLayout />}>
                        {routes}
                    </Route>
                </Routes>
            </BrowserRouter>
        </Provider>
    )
}

export default App

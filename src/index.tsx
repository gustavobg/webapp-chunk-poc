import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {
    BrowserRouter,
    Link
} from "react-router-dom";

import RootRoutes from './rootRoutes';

function App() {
    return (
        <div>
            <BrowserRouter>
                <ul>
                    <li>
                        <Link to="/management/stock">Stock</Link>
                    </li>
                    <li>
                        <Link to="/management/stock/history">History</Link>
                    </li>
                    <li>
                        <Link to="/billing/subscription/videoteca">Videoteca</Link>
                    </li>
                    <li>
                        <Link to="/billing/upgrade/ao">Agendamento online</Link>
                    </li>
                </ul>
                <RootRoutes />
            </BrowserRouter>
        </div>
    );
}

const wrapper = document.getElementById("webapp");
ReactDOM.render(<App/>, wrapper);

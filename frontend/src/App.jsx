import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CreateBill from './pages/CreateBill';
import InvoiceView from './pages/InvoiceView';
import Settings from './pages/Settings';
import ShortBills from './pages/ShortBills';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Staff Area */}
        <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="new-bill" element={<CreateBill />} />
                <Route path="short-bills" element={<ShortBills />} />
                <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="/invoice/:id" element={<InvoiceView />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import DealList from './pages/DealList';
import NewDeal from './pages/NewDeal';
import Prices from './pages/Prices';
import Settlements from './pages/Settlements';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/deals" replace />} />
        <Route path="/deals" element={<DealList />} />
        <Route path="/deals/new" element={<NewDeal />} />
        <Route path="/prices" element={<Prices />} />
        <Route path="/settlements" element={<Settlements />} />
      </Route>
    </Routes>
  );
}

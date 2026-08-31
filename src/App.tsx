/* Routes. The prototype had no routing — the handoff asks for real routes, so
   each screen has a URL and the browser back button works. */

import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { MinSide } from "./screens/MinSide";
import { MineProdusenter } from "./screens/MineProdusenter";
import { MineProdukter } from "./screens/MineProdukter";
import { LagredeSok } from "./screens/LagredeSok";
import { Sok } from "./screens/Sok";

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/min-side" replace />} />
        <Route path="/min-side" element={<MinSide />} />
        <Route path="/produsenter" element={<MineProdusenter />} />
        <Route path="/produkter" element={<MineProdukter />} />
        <Route path="/lagrede-sok" element={<LagredeSok />} />
        <Route path="/sok" element={<Sok />} />
        <Route path="*" element={<Navigate to="/min-side" replace />} />
      </Route>
    </Routes>
  );
}

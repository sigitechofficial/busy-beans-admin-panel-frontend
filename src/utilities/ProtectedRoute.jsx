import { AuthCheck } from "./AuthCheck";

export default function ProtectedRoute({children}) {
  AuthCheck();
  return children;
}

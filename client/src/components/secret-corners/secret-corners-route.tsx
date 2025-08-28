import SecretCornersModern from "@/pages/secret-corners-modern";
import { SecretCornersAccessWrapperComplete } from "./secret-corners-access-wrapper-complete";

/**
 * This is a wrapper component that applies access control to the Secret Corners page
 * It checks if the user is authenticated and has appropriate permissions
 * before rendering the actual Secret Corners content
 */
export function SecretCornersRoute() {
  return (
    <SecretCornersAccessWrapperComplete>
      <SecretCornersModern />
    </SecretCornersAccessWrapperComplete>
  );
}
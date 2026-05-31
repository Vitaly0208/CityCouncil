import { useNavigate } from "react-router-dom";
import { tokenService} from "../../api/tokenService.js";

export const useAuthRedirect = () => {
    const navigate = useNavigate();

    return (actionCallback, redirectPath = "/register") => {
        if (!tokenService.getAccessToken()) {
            navigate(redirectPath);
            return;
        }
        actionCallback();
    };
};
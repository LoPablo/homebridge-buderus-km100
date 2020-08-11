import {JsonResponse} from "./jsonResponse";

export default interface apiValueDelegate{
    hasNewValue(data : JsonResponse) : void;
    hadNewValueError(error : any) : void;
}
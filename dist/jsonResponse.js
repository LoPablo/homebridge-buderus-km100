"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonResponse = void 0;
class JsonResponse {
    constructor(id, type, writable, recordable, value, allowedValues) {
        this.id = id;
        this.type = type;
        this.writable = writable;
        this.recordable = recordable;
        this.value = value;
        this.allowedValues = allowedValues;
    }
    static fromJSONString(json) {
        let jsonObject = JSON.parse(json);
        return this.fromObject(jsonObject);
    }
    static fromObject(object) {
        return new JsonResponse(object.id, object.type, object.writable, object.recordable, object.value, object.allowedValues);
    }
}
exports.JsonResponse = JsonResponse;
//# sourceMappingURL=jsonResponse.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonResponse = void 0;
class JsonResponse {
    constructor(raw, id, type, writeable, recordable, value, allowedValues, unitOfMeasure) {
        this.id = id;
        this.type = type;
        this.writeable = writeable;
        this.recordable = recordable;
        this.value = value;
        this.allowedValues = allowedValues;
        this.unitOfMeasure = unitOfMeasure;
        this.raw = raw;
    }
    static fromJSONString(json) {
        let jsonObject = JSON.parse(json);
        return this.fromObject(json, jsonObject);
    }
    static fromObject(raw, object) {
        return new JsonResponse(raw, object.id, object.type, object.writeable, object.recordable, object.value, object.allowedValues, object.unitOfMeasure);
    }
}
exports.JsonResponse = JsonResponse;
//# sourceMappingURL=jsonResponse.js.map
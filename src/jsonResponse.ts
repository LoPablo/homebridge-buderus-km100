export class JsonResponse{
    id? : string;
    type? : string;
    writeable? : number;
    recordable? : number;
    value? : any;
    allowedValues? : [any];
    unitOfMeasure? : string;
    raw : string;

    constructor(raw : string, id?: string, type?: string, writeable?: number, recordable?: number, value? :any, allowedValues? : [any] , unitOfMeasure? : string) {
       this.id=id;
       this.type=type;
       this.writeable=writeable;
       this.recordable=recordable;
       this.value=value;
       this.allowedValues=allowedValues;
       this.unitOfMeasure = unitOfMeasure;
       this.raw = raw;
    }

    static fromJSONString(json: string): JsonResponse {
        let jsonObject = JSON.parse(json);
        return this.fromObject(json, jsonObject);
    }

    static fromObject(raw : string, object: any): JsonResponse {
        return new JsonResponse(
            raw,
            object.id,
            object.type,
            object.writeable,
            object.recordable,
            object.value,
            object.allowedValues,
            object.unitOfMeasure
        )
    }
}
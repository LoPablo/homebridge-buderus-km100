export class JsonResponse{
    id? : string;
    type? : string;
    writable? : number;
    recordable? : number;
    value? : any;
    allowedValues? : [any];

    constructor(id?: string, type?: string, writable?: number, recordable?: number, value? :any, allowedValues? : [any]) {
       this.id=id;
       this.type=type;
       this.writable=writable;
       this.recordable=recordable;
       this.value=value;
       this.allowedValues=allowedValues;
    }

    static fromJSONString(json: string): JsonResponse {
        let jsonObject = JSON.parse(json);
        return this.fromObject(jsonObject);
    }

    static fromObject(object: any): JsonResponse {
        return new JsonResponse(
            object.id,
            object.type,
            object.writable,
            object.recordable,
            object.value,
            object.allowedValues
        )
    }
}
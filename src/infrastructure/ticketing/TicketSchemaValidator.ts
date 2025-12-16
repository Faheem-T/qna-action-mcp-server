import Ajv, { type ValidateFunction } from "ajv";
import type { ISchemaValidator } from "../../domain/services/ISchemaValidator";

export class TicketSchemaValidator implements ISchemaValidator {
  private readonly _validate: ValidateFunction;
  constructor(schema: Record<string, any>) {
    const ajv = new Ajv();
    this._validate = ajv.compile(schema);
  }

  validate = async (input: any): Promise<void> => {
    const valid = this._validate(input);
    if (!valid) {
      throw this._validate.errors;
    }
  };
}

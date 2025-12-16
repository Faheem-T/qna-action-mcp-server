export interface ISchemaValidator {
  validate(input: any): Promise<void>;
}

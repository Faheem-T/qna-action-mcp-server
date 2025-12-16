import type { ISchemaValidator } from "../../domain/services/ISchemaValidator";
import type { ITicketingService } from "../../domain/services/ITicketingService";

export class TicketingService implements ITicketingService {
  constructor(
    private readonly _endpoint: string,
    private readonly _method: string,
    private readonly _validator: ISchemaValidator,
  ) {}

  createTicket = async (input: any) => {
    await this._validator.validate(input);
    // await fetch(this._endpoint, { method: this._method, body: input });
    console.error(`Mocking request to ${this._endpoint}`);
    console.error(`Method: ${this._method}`);
    console.error(`Body: ${input}`);
  };
}

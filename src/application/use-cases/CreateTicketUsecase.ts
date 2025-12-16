import type { ITicketingService } from "../../domain/services/ITicketingService";

export class CreateTicketUsecase {
  constructor(private readonly _ticketingService: ITicketingService) {}
  exec = async (input: any) => {
    await this._ticketingService.createTicket(input);
  };
}

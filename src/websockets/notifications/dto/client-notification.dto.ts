export class ClientNotificationDto {
  constructor(
    public id: string,
    public name: string,
    public surname: string,
    public email: string,
    public phone: string,
    public address: string,
    public createdAt: string,
    public updatedAt: string,
  ) {}
}

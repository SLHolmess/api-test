import { AppException} from "dth-core";

export class NotFoundException extends AppException {
  constructor(data?: any) {
    super('RESOURCE_NOT_FOUND', 'Lỗi truy cập dữ liệu không tồn tại', data);
  }
}

import { Controller, Route } from "dth-core/decorators";
import AuthProvider from "../../includes/auth";
import { AppController } from "dth-core";
import { Request } from "express";
import Setting from "./setting.model";
import { NotFoundException } from "../../includes/exceptions";



@Controller({
   prefix: '/settings',
   middlewares: [ AuthProvider.requireAuth() ]
})
export default class SettingController extends AppController {
  @Route('PUT /:key')
  async update(req: Request & any) {
    const setting = await this.findOrCreate(req.params.key);

    setting.value = req.body.value;

    await setting.save();

    return setting;
  }

  @Route('GET /:key')
  async findOne(req: Request & any) {
    const setting = await Setting.findOne({ key: req.params.key });
    if (!setting) throw new NotFoundException().withMessage('Không tìm thấy cấu hình!');

    return setting;
  }


  async findOrCreate(key: string): Promise<any> {
    let setting = await Setting.findOne({ key });

    if (!setting) {
      setting = new Setting({ key });

      await setting.save();
    }

    return setting;
  }
}
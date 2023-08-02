import { PHONG_THUY_API_URL } from './config';
import axios from "axios";
import { AppException, AppLogger as logger } from 'dth-core';

const PhongThuyAPI = {
  async searchSim(searchData: any) {
    try {
      const apiEndpoint = `${PHONG_THUY_API_URL}search/sim`;
      const res = await axios.post(apiEndpoint, searchData);
      
      if (res.data?.message != 'success') throw new AppException('PHONG_THUY_SEARCH_SIM_ERROR', res.data.message)
      return res.data
    } catch(err) {
      logger.error(`[PHONG_THUY_SEARCH_SIM_ERROR] ${err.stack}`);
    }
  },

  async boiSim(searchData: any) {
    try {
      const apiEndpoint = `${PHONG_THUY_API_URL}tool/boisim`;
      const res = await axios.post(apiEndpoint, searchData);
      if (res.data?.message != 'success') throw new AppException('PHONG_THUY_BOI_SIM_ERROR', res.data.message)
      return res.data
    } catch(err) {
      logger.error(`[PHONG_THUY_BOI_SIM_ERROR] ${err.stack}`);
    }
  }
}


export default PhongThuyAPI;
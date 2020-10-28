
import fs from "fs";
import path from "path";
import Cron from "cron";
import _ from "underscore";

const fname = 'cronJobs.initialize()';
const p = '../../../../crons';



export default class CronRunner {

  constructor(felony) {
    /**
     * @type Felony
     */
    this.felony = felony;
  }

  /**
   * Loads the job or fails silently.
   *
   * @param file
   * @return {Object|null}
   */
  async _load (file) {
    try {
      return await import(`${this.felony.appRootPath}/crons/${file}`);
    }
    catch (e) {
      console.log(`${fname} error, could not load "${file}" cron.`);
      console.log(e);
    }
  };

  async initialize() {
    /**
     * If the server is started with
     * node index.js http cron
     * Crons will be loaded
     */
    if (!Felony.arguments.cron) {
      return;
    }
    global._cron = {};

    // Get all the created cron jobs in "crons" folder.
      fs.readdir(path.resolve('./crons'), async (error, jobs) => {
        if (error) {
          return Felony.log.error(`${fname} Internal error occurred: ${error}`);
        }
        
        // async load cron files
        const jobPromises = jobs.map((job) => this._load(job));
      
        jobs = [];

        // resolve promises from loading cron
        for (let i = 0; i < jobPromises.length; i++) {
          jobPromises[i] = await jobPromises[i];
          jobs.push(jobPromises[i].default);
        }

        // filter jobs which failed to load and jobs that aren't active
        jobs = jobs.filter(job => (job !== undefined && job !== null) && job.active());
        
        // Load the cron with the set schedule
        _.each(jobs, (job) => {
          _cron[job.identity()] = new Cron.CronJob(job.schedule(), (one, two) => {
            Felony.log.log(`${job.identity()} started at: ${`${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`}`);
            try {
              job.handle();
              job.onSuccess();
            } catch (error) {
              job.onError();
            }
          }, null, true, 'UTC');
        });
    });
  }
}



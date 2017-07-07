/**
 * Class Timer.
 */
export class Timer {

    public beginAt: Date;
    public endAt: Date;
    public time = 0;

    /**
     * Starts timer
     */
    public start() {
        if (!this.beginAt) {
            this.beginAt = new Date();
        }
    }

    /**
     * Stops timer
     */
    public stop() {
        if (this.beginAt && !this.endAt) {
            this.endAt = new Date();
            this.time = this.endAt.getTime() - this.beginAt.getTime();
        }
    }

}

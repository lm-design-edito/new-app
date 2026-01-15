import { Bem } from "@design-edito/tools/agnostic/css/bem"
import { Component } from "preact"

type Props = {
  timecodeInMs: number
}

class Timecode extends Component<Props> {
  bemClss = Bem.bem('lm-audio-quote-timecode')

  render() {
    const { props, bemClss } = this
    const { timecodeInMs } = props
    const hours = Math.floor(timecodeInMs / (60 * 60 * 1000));
    const minutes = Math.floor((timecodeInMs % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((timecodeInMs % (60 * 1000)) / 1000);
    const milliseconds = Math.floor(timecodeInMs % 1000); 

    console.log({hours, minutes, seconds, milliseconds})

    const wrapperClasses = [bemClss.value]
    const hoursClasses = [bemClss.elt('hours').value]
    const minutesClasses = [bemClss.elt('minutes').value]
    const secondsClasses = [bemClss.elt('seconds').value]
    const millisecondsClasses = [bemClss.elt('subs-container').value]

    const separatorHoursMinutesClasses = [bemClss.elt('separator').value, bemClss.elt('separator').modifier('h-m').value]
    const separatorMinutesSecondsClasses = [bemClss.elt('separator').value, bemClss.elt('separator').modifier('m-s').value]
    const separatorSecondsMillisecondsClasses = [bemClss.elt('separator').value, bemClss.elt('separator').modifier('s-ms').value]

    return (
      <div className={wrapperClasses.join(' ')}>
        <span className={hoursClasses.join(' ')}>{hours.toString().padStart(2, '0')}</span>
        <span className={separatorHoursMinutesClasses.join(' ')}>:</span>
        <span className={minutesClasses.join(' ')}>{minutes.toString().padStart(2, '0')}</span>
        <span className={separatorMinutesSecondsClasses.join(' ')}>:</span>
        <span className={secondsClasses.join(' ')}>{seconds.toString().padStart(2, '0')}</span>
        <span className={separatorSecondsMillisecondsClasses.join(' ')}>,</span>
        <span className={millisecondsClasses.join(' ')}>{milliseconds.toString().padStart(3, '0')}</span>
      </div>
    )
  }
}

export { Props }
export default Timecode
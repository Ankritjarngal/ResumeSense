import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

export function RenderScore({ score }) {
    return (
        <div className="flex justify-center">
            <CircularProgressbar
                value={score}
                minValue={0}
                maxValue={100}
                text={`${score}%`}
                className="circular-progress"
            />
        </div>
    );
}
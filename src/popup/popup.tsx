import React, { FC } from 'react';
import { render } from 'react-dom';
import './popup.css'

interface IProps {

}

type task = {
    title: string,
    description: string,
    deadline: number,
    expires: number
}
interface taskState {
    tasks: task[]
}
interface taskInputs {
    titleInput: string
    descInput: string
    deadlineInput: number
}
interface toggle {
    id: number | null
    isOpen: boolean
}

export const Popup: FC<IProps> = () => {
    const [taskState, setTaskState] = React.useState <taskState>({
        tasks: [],
    })
    const [inputs, setInputs] = React.useState <taskInputs>({ 
        titleInput: '',
        descInput: '',
        deadlineInput: 0,
    })
    const [toggle, setToggle] = React.useState <toggle>({
        id: null,
        isOpen: false,
    })

    React.useEffect(() => {
        chrome.storage.sync.get('tasks', (res: any) => {
            console.log(Object.entries(res))
            if(res && res.tasks && res.tasks.length > 0) {
                setTaskState({ ...taskState, tasks:[...res.tasks] })
            }
        })
    },[])

    const handleInput = (event: React.ChangeEvent):void => {
        const target = (event.currentTarget as HTMLInputElement)
        
        setInputs({...inputs, [target.name]: target.value})
    }

    const submitTask = async (event: React.MouseEvent) => {
        event.preventDefault();
        const currentUnix = Math.round(new Date().getTime() / 1000)
        const expireDate = (inputs.deadlineInput * 24 * 60 * 60) + currentUnix
        setTaskState({
            ...taskState, 
            tasks: [ 
                ...taskState.tasks,
                {
                    title: inputs.titleInput,
                    description: inputs.descInput,
                    deadline: inputs.deadlineInput,
                    expires: expireDate,
                }
            ] 
        })
        setInputs({
            titleInput: '',
            descInput: '',
            deadlineInput: 0,
        })

        const taskCopy: any = await chrome.storage.sync.get('tasks')
        if ( taskCopy && taskCopy.tasks ) {
            chrome.storage.sync.set({
                tasks: [...taskCopy.tasks,
                    {
                        title: inputs.titleInput,
                        description: inputs.descInput,
                        deadline: inputs.deadlineInput,
                        expires: expireDate,
                    }
                ]
            })
        } else {
            chrome.storage.sync.set({
                tasks: [
                    {
                        title: inputs.titleInput,
                        description: inputs.descInput,
                        deadline: inputs.deadlineInput,
                        expires: expireDate,
                    }
                ]
            })
        }
    }

    function getTimeLeft(exp: number): string {
        const unixTime: number = Math.round(new Date().getTime() / 1000)
      
        if( unixTime < exp ) {
            const diff: number =  Math.abs(exp - unixTime)*1000
            
            //Get hours from milliseconds
            const hours = diff / (1000*60*60);
            const absoluteHours = Math.floor(hours);
            const h = absoluteHours > 9 ? absoluteHours : '0' + absoluteHours;

            //Get remainder from hours and convert to minutes
            const minutes = (hours - absoluteHours) * 60;
            const absoluteMinutes = Math.floor(minutes);
            const m = absoluteMinutes > 9 ? absoluteMinutes : '0' +  absoluteMinutes;

            //Get remainder from minutes and convert to seconds
            const seconds = (minutes - absoluteMinutes) * 60;
            const absoluteSeconds = Math.floor(seconds);
            const s = absoluteSeconds > 9 ? absoluteSeconds : '0' + absoluteSeconds;
            
            return `${h}:${m}:${s}`;
        } else {
            return `expired`
        }   
    }

    function toggleOpenTask(event: React.MouseEvent): void {
        event.preventDefault();
        const task: Element = event.currentTarget
        if (~~task.id === toggle.id) {
            setToggle({ ...toggle, isOpen: !toggle.isOpen })
        } else {
            setToggle({ id: ~~task.id, isOpen: true })
        }
    }

    return (
        <div className='App'>
            <div className='header'>
                <section className='input-container' >
                    <input type='text'
                        name='titleInput'
                        value={inputs.titleInput}
                        onChange={(e) => handleInput(e)}
                        placeholder='Task...' />
                    <input type='text'
                        name='descInput'
                        value={inputs.descInput}
                        maxLength={150}
                        onChange={(e) => handleInput(e)}
                        placeholder='Desc...' />
                    <input type='number'
                        name='deadlineInput'
                        value={inputs.deadlineInput}
                        onChange={(e) => handleInput(e)}
                        max={60}
                        defaultValue={1}
                        placeholder='days until deadline...' />
                </section>
                <button onClick={submitTask}>Create task</button>
            </div>
            <div className='todo'>
            {   taskState.tasks.length > 0 && taskState.tasks.map( (item, indx) => {
                    const exp = getTimeLeft(item.expires);
                    return (
                        <div 
                        onClick={(event) => toggleOpenTask(event)}
                        className= {indx === toggle.id && toggle.isOpen ? 'task-open' : 'task'} 
                        id={String(indx)}>
                            <h3 className='t-title'>
                                Task:
                                {` ${item.title}`}
                            </h3>
                            <div className='t-time-table'>
                                <h4 className='t-time'>
                                    deadline:
                                    {exp === 'expired' ?
                                        <>
                                            <h1 className='exp'>{exp}</h1>
                                            <button className='remove-exp'>
                                                Remove
                                            </button>
                                        </> 
                                    :   
                                        <> 
                                            <h1 className='t-deadline'>{exp}</h1>
                                            <button className='remove-tsk'>
                                                Remove
                                            </button>
                                        </> 
                                    }
                                </h4>
                            </div>
                            <p className= {indx === toggle.id && toggle.isOpen ? 't-desc-open' : 't-desc'}>
                                Description: 
                                {` ${item.description}`}
                            </p>
                        </div>
                    )
                })

            }
            </div>
        </div>
    );
}

render ( <Popup/>, document.getElementById('popup') );
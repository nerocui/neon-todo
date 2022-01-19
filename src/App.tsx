import React, { Component, useCallback, useState } from 'react';
import uniqid from 'uniqid';
import onClickOutside from 'react-onclickoutside';

type ToDoItem = {
  id: string,
  checked: boolean,
  title: string,
  description: string,
  starred: boolean,
  createdAt: Date,
}

type DialogProps = {
  item: ToDoItem|null,
  onBlur: () => void,
  onSave: (item: ToDoItem) => void
}

type DialogState = {
  editing: boolean,
  description: string
}

class MyDialog extends Component<DialogProps, DialogState> {
  constructor(props: DialogProps) {
    super(props);
    this.state = {
      editing: false,
      description: props?.item?.description || ''
    };
  }

  handleClickOutside = (evt: any) => {
    this.props.onBlur();
  };

  render() {
    return (
      <div
        className='dialog'>
        {
          this.props?.item &&
          (
            <div className='dialogContent'>
              <h2>{this.props.item?.title}</h2>
              <div>
                <h4>Description</h4>
                {this.props?.item.description.trim() === '' || this.state.editing ? 
                (
                  <form onSubmit={e => {
                    e.preventDefault();
                    this.props?.onSave({...this.props.item!, description: this.state.description});
                  }}>
                    <div
                      style={{ display: 'flex' }}>
                      <input type='text' value={this.state.description} onChange={e => this.setState({description: e.target.value})}/>
                      <button style={{ marginLeft: '.5rem', marginRight: '.5rem' }} type='submit'>Save</button>
                      <button onClick={() => this.setState({ editing: false })}>Cancel</button>
                    </div>
                  </form>
                ):
                <div style={{ height: '2.4rem', display: 'flex' }}>
                  <p style={{ alignSelf: 'center', padding: '.2rem' }} className="editable" onClick={() => this.setState({editing: true})}>{this.props?.item.description}</p>
                </div>
                  
                }
              </div>
            </div>
          )
        }
      </div>
    )
  }
}

const ItemDialog = ({item, onBlur, onSave}: { item: ToDoItem|null, onBlur: () => void, onSave: (item: ToDoItem) => void }) => {
  const MyComponent = onClickOutside(MyDialog);
  return <MyComponent item={item} onBlur={onBlur} onSave={onSave}/>
}

const App = () => {
  const storageItems = localStorage.getItem('todoitems');
  let list: Array<ToDoItem> = [];
  if (!!storageItems) {
    list = JSON.parse(storageItems);
  }
  const [items, setItemsState] = useState<Array<ToDoItem>>(list);
  const setItems = useCallback((myItems: Array<ToDoItem>) => {
    localStorage.setItem('todoitems', JSON.stringify(myItems));
    setItemsState(myItems);
  }, [items, setItemsState]);
  const [text, setText] = useState('');
  const [selectedItem, setSelectedItem] = useState<ToDoItem|null>(null);
  const addItem = useCallback((title: string) => {
    if (title?.trim() != '') {
      setItems([{
        id: uniqid(),
        title,
        checked: false,
        description: '',
        starred: false,
        createdAt: new Date()
      }, ...items]);
    }
  }, [items, setItems]);
  const onCheck = useCallback((id: string) => {
    const newItems = new Array<ToDoItem>();
    items.forEach(item => {
      if (id === item.id) {
        item.checked = !item.checked;
      }
      newItems.push(item);
    })
    setItems(newItems);
  }, [items, setItems]);

  const onSave = useCallback((td: ToDoItem) => {
    const newItems = new Array<ToDoItem>();
    items.forEach(item => {
      if (td.id === item.id) {
        newItems.push(td);
        setSelectedItem(td);
      } else {
        newItems.push(item);
      }
    })
    setItems(newItems);
  }, [items, setItems, setSelectedItem])

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={{ margin: '1rem' }}>
        <h1 style={{ marginBottom: '1rem' }}>
          Neon To Do
        </h1>
        <div style={{ marginBottom: '1rem' }}>
          {items.map(item => (
            <div id={item.id} style={{ display: 'flex' }}>
              <div>
                <label className="checkbox">
                  <input
                    type="checkbox"
                    onChange={() => onCheck(item.id)}
                    checked={item.checked}/>
                  <span className="checkmark" tabIndex={1}>
                    <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path className="path" d="M15.2733 0.830727L4.9431 11.1693L0.726807 6.92629" stroke="var(--Alt)" stroke-width="1.45135" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </span>
                </label>
              </div>
              <a
                onClick={e => setSelectedItem(item)}
                style={{ marginLeft: '2.4rem', alignSelf: 'center', textDecoration: item.checked ? 'line-through' : 'none' }}>
                {item.title}
              </a>
            </div>
          ))}
        </div>
        <form
          onSubmit={e => {
            e.preventDefault();
            if (text.trim() != '') {
              addItem(text);
              setText('');
            }
          }}>
          <div style={{ display: 'flex' }}>
            <input
              value={text}
              onChange={e => {
                setText(e.target.value);
              }}
              type='text'
              style={{ marginRight: '1rem' }}/>
            <button type='submit'>
              Add
            </button>
          </div>
        </form>
      </div>
      <div
        className='overlay'
        style={{ display: selectedItem === null ? 'none' : 'flex' }}>
        <ItemDialog item={selectedItem} onBlur={() => setSelectedItem(null)} onSave={onSave}/>
      </div>
    </div>
  );
}

export default App;

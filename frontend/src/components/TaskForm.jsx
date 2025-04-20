import { useState, useRef, useEffect } from 'react';
import Select from 'react-select';
import './TaskForm.css';

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
];

const categoryOptions = [
  { value: 'bug', label: 'Bug' },
  { value: 'feature', label: 'Feature' },
  { value: 'enhancement', label: 'Enhancement' }
];

const TaskForm = ({ task, onSubmit, onClose }) => {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState(
    task?.priority ? priorityOptions.find(o => o.value === task.priority) : priorityOptions[1]
  );
  const [category, setCategory] = useState(
    task?.category ? categoryOptions.find(o => o.value === task.category) : null
  );
  const [attachment, setAttachment] = useState(task?.attachment || null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef();

  useEffect(() => {
    // If there's an existing attachment and it's an image, show it in preview
    if (task?.attachment && /\.(png|jpe?g|gif|webp)$/i.test(task.attachment)) {
      setPreview(task.attachment);
    }
  }, [task?.attachment]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newTask = {
      id: task?.id || null,
      title,
      description,
      priority: priority.value,
      category: category?.value || null,
      attachment,
      status: task?.status || 'To Do'
    };
    onSubmit(newTask);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isImage = /\.(png|jpe?g|gif|webp)$/i.test(file.name);
    if (isImage) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreview(null); // not an image
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      setAttachment(data.fileUrl);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
    setPreview(null);
  };

  return (
    <div className="modal-overlay">
      <div className="task-form">
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>{task ? 'Edit Task' : 'Create New Task'}</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Priority</label>
              <Select
                options={priorityOptions}
                value={priority}
                onChange={setPriority}
                isSearchable={false}
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <Select
                options={categoryOptions}
                value={category}
                onChange={setCategory}
                isClearable
                isSearchable={false}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Attachment</label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="upload-btn"
            >
              {attachment ? 'Change File' : 'Upload File'}
            </button>

            {attachment && (
              <div className="attachment-preview">
                {preview ? (
                  <img src={preview} alt="Preview" />
                ) : (
                  <span>File attached</span>
                )}
                <button
                  type="button"
                  onClick={handleRemoveAttachment}
                  className="remove-attachment"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit">{task ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;

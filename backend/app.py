from flask import Flask, request, jsonify, send_file, Response
from flask_cors import CORS
from services.translation_service import TranslationService
from werkzeug.utils import secure_filename
import threading
import queue
import json
import time
import os
import uuid

app = Flask(__name__)
CORS(app)

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Store translation progress
translation_progress = {}
translation_queues = {}

def send_translation_progress(translation_id):
    while True:
        try:
            # Get progress from queue
            progress_data = translation_queues[translation_id].get(timeout=1)
            
            # Check if translation is complete
            if progress_data.get('complete'):
                yield f"data: {json.dumps(progress_data)}\n\n"
                break
                
            # Send progress update
            yield f"data: {json.dumps(progress_data)}\n\n"
            
        except queue.Empty:
            # Send heartbeat to keep connection alive
            yield f"data: {json.dumps({'heartbeat': True})}\n\n"
            
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
            break

def progress_callback(translation_id):
    def callback(data):
        if translation_id in translation_queues:
            translation_queues[translation_id].put(data)
    return callback

def process_translation(translation_id, filepath, target_language, provider, model):
    try:
        # Update progress
        translation_progress[translation_id] = {
            'progress': 0,
            'message': 'Starting translation...',
            'complete': False,
            'error': None,
            'translated_file': None
        }

        # Initialize translation service
        translation_service = TranslationService()
        translation_service.set_progress_callback(progress_callback(translation_id))
        
        # Translate the file
        translated_filename = translation_service.translate_excel(
            file_path=filepath,
            target_language=target_language,
            provider=provider,
            model=model
        )

        # Update final status
        translation_queues[translation_id].put({
            'progress': 100,
            'message': 'Translation completed!',
            'complete': True,
            'translated_file': translated_filename
        })

        # Clean up original file after successful translation
        if os.path.exists(filepath):
            os.remove(filepath)

    except Exception as e:
        # Update error status
        translation_queues[translation_id].put({
            'error': str(e),
            'complete': True
        })
        # Clean up on error
        if os.path.exists(filepath):
            os.remove(filepath)

@app.route('/translate', methods=['POST'])
def translate():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if not file.filename.endswith(('.xlsx', '.xls')):
        return jsonify({'error': 'Invalid file type. Please upload an Excel file'}), 400

    target_language = request.form.get('target_language', 'es')
    provider = request.form.get('provider', 'groq')
    model = request.form.get('model')
    
    try:
        # Generate a unique ID for this translation
        translation_id = str(uuid.uuid4())
        
        # Save the file temporarily
        filename = secure_filename(file.filename)
        temp_filepath = os.path.join(app.config['UPLOAD_FOLDER'], f"{translation_id}_{filename}")
        file.save(temp_filepath)

        # Create progress queue
        translation_queues[translation_id] = queue.Queue()
        
        # Start translation in a background thread
        thread = threading.Thread(
            target=process_translation,
            args=(translation_id, temp_filepath, target_language, provider, model)
        )
        thread.daemon = True
        thread.start()

        return jsonify({
            'status': 'success',
            'message': 'Translation started',
            'translation_id': translation_id
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/translation-progress')
def get_translation_progress():
    translation_id = request.args.get('id')
    if not translation_id or translation_id not in translation_queues:
        return jsonify({'error': 'Invalid translation ID'}), 400
        
    return Response(
        send_translation_progress(translation_id),
        mimetype='text/event-stream'
    )

@app.route('/download/<path:filename>')
def download_file(filename):
    try:
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        if not os.path.exists(file_path):
            return jsonify({'error': f'File not found: {filename}'}), 404
            
        return send_file(
            file_path,
            as_attachment=True,
            download_name=filename,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
    except Exception as e:
        return jsonify({'error': f'Download failed: {str(e)}'}), 500

@app.route('/supported-languages')
def get_supported_languages():
    languages = [
        {"code": "es", "name": "Spanish"},
        {"code": "fr", "name": "French"},
        {"code": "de", "name": "German"},
        {"code": "it", "name": "Italian"},
        {"code": "pt", "name": "Portuguese"}
    ]
    return jsonify({"languages": languages})

@app.route('/providers')
def get_providers():
    providers = [
        {
            "name": "groq",
            "models": [
                "gemma2-9b-it",
                "llama-3.3-70b-versatile",
                "llama-3.1-8b-instant",
                "llama-guard-3-8b",
                "llama3-70b-8192",
                "llama3-8b-8192",
                "mixtral-8x7b-32768",
                "whisper-large-v3",
                "whisper-large-v3-turbo"
            ]
        },
        {
            "name": "openai",
            "models": [
                "gpt-4o-mini-realtime-preview-2024-12-17",
                "gpt-4o",
                "gpt-4o-mini",
                "gpt-3.5-turbo"
            ]
        },
        {
            "name": "google",
            "models": [
                "gemini-1.5-flash",
                "gemini-2.0-flash-exp",
                "gemini-1.5-flash-8b",
                "gemini-1.5-pro"
            ]
        },
        {
            "name": "anthropic",
            "models": [
                "claude-3-5-sonnet-20241022",
                "claude-3-5-haiku-20241022",
                "claude-3-opus-20240229",
                "claude-3-sonnet-20240229",
                "claude-3-haiku-20240307"
            ]
        }
    ]
    return jsonify({"providers": providers})

@app.route('/')
def root():
    return jsonify({"message": "Excel Translation API"})

@app.route('/health')
def health_check():
    return jsonify({"status": "healthy"})

@app.route('/ai-providers', methods=['GET'])
def get_ai_providers():
    return jsonify({
        "providers": [
            {"id": "groq", "name": "Groq AI", "models": ["llama3-8b-8192"]},
            {"id": "anthropic", "name": "Anthropic AI", "models": ["claude-3-5-sonnet-20241022"]},
            {"id": "openai", "name": "OpenAI", "models": ["gpt-4"]},
            {"id": "google", "name": "Google AI", "models": ["gemini-2.0-flash-exp"]}
        ]
    })

@app.route('/upload', methods=['POST'])
def upload_file():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
            
        file = request.files['file']
        ai_provider = request.form.get('ai_provider')
        target_language = request.form.get('target_language')
        
        if not all([file, ai_provider, target_language]):
            return jsonify({"error": "Missing required fields"}), 400

        # Create temporary directory for file processing
        with tempfile.TemporaryDirectory() as temp_dir:
            filename = secure_filename(file.filename)
            temp_file = os.path.join(temp_dir, filename)
            output_file = os.path.join(temp_dir, f"translated_{filename}")
            
            # Save uploaded file
            file.save(temp_file)
            
            # Create a copy of the original file
            shutil.copy2(temp_file, output_file)
            
            # Load workbook
            wb = openpyxl.load_workbook(output_file)
            
            # Process each sheet
            for sheet_name in wb.sheetnames:
                ws = wb[sheet_name]
                
                # Get all merged cell ranges
                merged_ranges = list(ws.merged_cells.ranges)
                
                # Unmerge all cells temporarily
                for merged_range in merged_ranges:
                    ws.unmerge_cells(str(merged_range))
                
                # Create a list to store translations
                translations = []
                
                # First pass: collect all text that needs translation
                for row in ws.rows:
                    for cell in row:
                        if cell.value and isinstance(cell.value, str):
                            translations.append({
                                'coordinate': cell.coordinate,
                                'text': cell.value,
                                'style': {
                                    'font': cell.font.copy(),
                                    'fill': cell.fill.copy(),
                                    'border': cell.border.copy(),
                                    'alignment': cell.alignment.copy(),
                                    'number_format': cell.number_format
                                }
                            })
                
                # Detect source language from the first non-empty cell
                if translations:
                    source_language = detect_language(translations[0]['text'])
                    
                    # Translate all text at once
                    for item in translations:
                        translated_text = translation_service.translate(
                            text=item['text'],
                            source_lang=source_language,
                            target_lang=target_language,
                            provider=ai_provider
                        )
                        
                        # Update cell with translation and preserve formatting
                        cell = ws[item['coordinate']]
                        cell.value = translated_text
                        
                        # Restore original styling
                        style = item['style']
                        cell.font = style['font']
                        cell.fill = style['fill']
                        cell.border = style['border']
                        cell.alignment = style['alignment']
                        cell.number_format = style['number_format']
                
                # Reapply merged cells
                for merged_range in merged_ranges:
                    ws.merge_cells(str(merged_range))
            
            # Save the workbook
            wb.save(output_file)
            
            # Read file and encode to base64
            with open(output_file, "rb") as f:
                file_content = base64.b64encode(f.read()).decode('utf-8')
            
            return jsonify({
                "status": "success",
                "message": "File translated successfully",
                "filename": f"translated_{filename}",
                "file_content": file_content
            })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=False)

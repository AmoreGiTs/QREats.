
import zipfile
import xml.etree.ElementTree as ET

path = "/home/am/Desktop/QREats/QREats SaaS project analysis.docx"

try:
    with zipfile.ZipFile(path) as z:
        xml_content = z.read("word/document.xml")
        root = ET.fromstring(xml_content)
        
        # Define namespace
        ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        
        text = []
        for p in root.findall('.//w:p', ns):
            p_text = []
            for t in p.findall('.//w:t', ns):
                if t.text:
                    p_text.append(t.text)
            text.append(''.join(p_text))
            
        print('\n'.join(text))

except Exception as e:
    print(f"Error: {e}")

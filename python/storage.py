import json
import time
import os
import fcntl


class OldVersionException(Exception):
    ...


class Storage:
    file_path = "storage.json"

    def __init__(self, file_path) -> None:
        self.file_path = file_path

    def _empty_data(self, version=time.time_ns()):
        return {"version": version, "data": {}}

    def clear_file(self):
        with open(self.file_path, 'w+') as outfile:
            fcntl.flock(outfile, fcntl.LOCK_EX)
            json.dump(self._empty_data(), outfile)
            fcntl.flock(outfile, fcntl.LOCK_UN)

    def _init_file(self):
        if (os.path.exists(self.file_path) == False):
            self.clear_file()

    async def get(self):
        self._init_file()
        with open(self.file_path, 'r') as file:
            fcntl.flock(file, fcntl.LOCK_SH)
            try:
                json_doc = json.load(file)
                if not isinstance(json_doc, dict):
                    json_doc = self._empty_data()
            except Exception:
                json_doc = self._empty_data()
            finally:
                fcntl.flock(file, fcntl.LOCK_UN)

        return (json_doc["version"], json_doc["data"])

    async def save(self, version, json_document):
        self._init_file()
        with open(self.file_path, 'r+') as file:
            fcntl.flock(file, fcntl.LOCK_EX)

            try:
                current_json_document = json.load(file)
                if not isinstance(current_json_document, dict):
                    current_json_document = self._empty_data(version)
            except Exception:
                current_json_document = self._empty_data(version)

            if (not current_json_document['version'] == version):
                raise OldVersionException(
                    "Version you trying to save is older then current version")

            file.seek(0)
            json.dump(
                {"version": time.time_ns(), "data": json_document}, file)
            file.truncate()
            fcntl.flock(file, fcntl.LOCK_UN)

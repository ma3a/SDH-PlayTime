import os
import unittest
import asyncio
from storage import Storage, OldVersionException


def async_test(coro):
    def wrapper(*args, **kwargs):
        loop = asyncio.new_event_loop()
        try:
            return loop.run_until_complete(coro(*args, **kwargs))
        finally:
            loop.close()
    return wrapper


class TestStorage(unittest.TestCase):

    file_path = "test_storage.json"
    storage: Storage

    def setUp(self) -> None:
        self.storage = Storage(self.file_path)
        self.storage.clear_file()
        return super().setUp()

    def tearDown(self) -> None:
        if os.path.exists(self.file_path):
            os.remove(self.file_path)
        return super().tearDown()

    @async_test
    async def test_saving(self):
        result = await self.storage.get()

        json_document = {'value': 1}
        await self.storage.save(version=result[0], json_document=json_document)
        retrieved_json_document = await self.storage.get()
        self.assertEqual(json_document, retrieved_json_document[1],
                         "Expecting same data as we saved before")

    @async_test
    async def test_should_forbids_old_data(self):
        result = await self.storage.get()

        json_document = {'value': 1}
        await self.storage.save(version=result[0], json_document=json_document)

        is_old_version_exception = False
        try:
            await self.storage.save(version=result[0], json_document=json_document)
        except OldVersionException:
            is_old_version_exception = True
        self.assertTrue(is_old_version_exception,
                        "Should throw exception when version is not equal current version of file")


if __name__ == '__main__':
    unittest.main()

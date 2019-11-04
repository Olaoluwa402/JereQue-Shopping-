FilePond.registerPlugin(
	FilePondPluginImagePreview,
	FilePondPluginImageResize,
	FilePondPluginFileEncode,
);

FilePond.setOptions({
	stylePanelAspectRatio: 100/80,
	imageResizeTargetWidth:100,
	imageResizeTargetHeight: 80
});
FilePond.parse(document.body);